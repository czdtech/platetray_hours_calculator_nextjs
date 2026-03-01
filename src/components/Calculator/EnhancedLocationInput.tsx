'use client'
import {
  DEFAULT_CITY,
  POPULAR_CITIES,
  type PopularCity,
} from '@/constants/popularCities'
import type { Locale } from '@/i18n/config'
import { getMessagesSync, t } from '@/i18n/getMessages'
import { createLogger } from '@/utils/unified-logger'
import { debounce } from 'lodash'
import { AlertCircle, Loader2, MapPin } from 'lucide-react'
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

// 将 logger 创建移到组件外部，避免每次渲染时重新创建
const logger = createLogger('LocationInput')

interface LocationInputProps {
  defaultLocation: string
  onLocationChange: (location: string) => void
  onUseCurrentLocation: (coords: {
    latitude: number
    longitude: number
    source?: string
    address?: string
  }) => void
  onTimezoneChange?: (timezone: string) => void // New prop for direct timezone updates
  onCitySelect?: (cityData: {
    latitude: number
    longitude: number
    timezone: string
    displayName: string
  }) => void // New prop for synchronized city selection
  locale?: Locale
}

interface Coordinates {
  latitude: number
  longitude: number
  source: 'browser' | 'input' | 'geocode' | 'prediction' | 'preset'
  address?: string
}

interface AddressComponent {
  long_name: string
  types: string[]
}

// Interface for predictions from our /api/maps/autocomplete
interface ApiAutocompletePrediction {
  description: string
  place_id: string
}

function EnhancedLocationInputComponent({
  defaultLocation,
  onLocationChange,
  onUseCurrentLocation,
  onTimezoneChange,
  onCitySelect,
  locale = 'en',
}: LocationInputProps) {
  const messages = getMessagesSync(locale)
  const calculatorMessages = messages.calculator
  const locationErrors = calculatorMessages.locationErrors
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFetchingToken, setIsFetchingToken] = useState(false)

  const [searchInput, setSearchInput] = useState(defaultLocation)
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null)
  const [predictions, setPredictions] = useState<ApiAutocompletePrediction[]>(
    []
  )
  const [showPredictions, setShowPredictions] = useState(false)
  const [activePredictionIndex, setActivePredictionIndex] = useState(-1)
  const [processingCitySelect, setProcessingCitySelect] = useState<
    string | null
  >(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const sessionTokenRef = useRef<string | undefined>(undefined)
  const lastRequestIdRef = useRef(0)
  const hasFetchedSessionTokenRef = useRef(false)
  const activeAutocompleteRequestControllerRef = useRef<AbortController | null>(
    null
  )

  // State for our backend service readiness (session token, etc.)
  const [isLocationServiceReady, setIsLocationServiceReady] = useState(false)
  const [locationServiceError, setLocationServiceError] = useState<
    string | null
  >(null)

  // 检查当前选中的城市
  const getCurrentSelectedCity = useMemo(() => {
    if (!currentCoords) {
      return null
    }

    const tolerance = 0.1 // degrees

    // 检查是否匹配默认城市
    if (
      Math.abs(DEFAULT_CITY.latitude - currentCoords.latitude) < tolerance &&
      Math.abs(DEFAULT_CITY.longitude - currentCoords.longitude) < tolerance
    ) {
      return DEFAULT_CITY.name
    }

    // 检查是否匹配热门城市
    for (const city of POPULAR_CITIES) {
      if (
        Math.abs(city.latitude - currentCoords.latitude) < tolerance &&
        Math.abs(city.longitude - currentCoords.longitude) < tolerance
      ) {
        return city.name
      }
    }

    return null
  }, [currentCoords])

  const fetchNewSessionToken = useCallback(async () => {
    logger.debug('🎫 开始获取新的会话令牌')
    setIsFetchingToken(true)
    try {
      const response = await fetch('/api/maps/session/start')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        logger.error(
          '❌ 非JSON响应:',
          new Error(`Server returned non-JSON response: ${text}`)
        )
        throw new Error('Server returned non-JSON response')
      }

      const data = await response.json()
      logger.debug('🔍 API响应:', data)

      if (data.sessionToken) {
        logger.info('✅ 成功获取会话令牌')
        sessionTokenRef.current = data.sessionToken
        setIsLocationServiceReady(true)
      } else {
        logger.error('❌ API响应中没有找到sessionToken:', data)
        throw new Error('Session token not found in response')
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      logger.error('❌ 获取会话令牌失败:', err)
      setLocationServiceError(locationErrors.initializeService)
    } finally {
      setIsFetchingToken(false)
    }
  }, [locationErrors])

  useEffect(() => {
    logger.debug('🗺️ 位置输入组件挂载')
    logger.debug(`📍 默认位置: ${defaultLocation}`)

    // 如果是默认位置（New York, NY），预填充坐标并跳过会话令牌获取
    if (defaultLocation === DEFAULT_CITY.displayName) {
      logger.debug('🏠 使用默认位置，预填充默认城市坐标并跳过会话令牌获取')
      setCurrentCoords({
        latitude: DEFAULT_CITY.latitude,
        longitude: DEFAULT_CITY.longitude,
        source: 'preset',
        address: DEFAULT_CITY.displayName,
      })
      return
    }

    if (!hasFetchedSessionTokenRef.current) {
      hasFetchedSessionTokenRef.current = true
      fetchNewSessionToken()
    }
  }, [defaultLocation, fetchNewSessionToken])

  const isCoordinates = (
    input: string
  ): { isValid: boolean; coords?: { lat: number; lng: number } } => {
    const coordsRegex =
      /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
    if (coordsRegex.test(input)) {
      const [lat, lng] = input.split(',').map(Number)
      return { isValid: true, coords: { lat, lng } }
    }
    return { isValid: false }
  }

  // 防抖处理，避免快速连续点击
  const lastCitySelectRef = useRef<number>(0)
  const CITY_SELECT_DEBOUNCE = 300 // 300ms防抖

  // Handle popular city selection - 优化性能，避免INP问题
  const handlePopularCitySelect = useCallback(
    (city: PopularCity) => {
      const now = Date.now()


      // 防抖检查
      if (now - lastCitySelectRef.current < CITY_SELECT_DEBOUNCE) {
        logger.info(`🚫 [Debounce] 跳过快速连续的城市选择`)
        return
      }
      lastCitySelectRef.current = now

      const startTime = performance.now()

      // 使用 requestAnimationFrame 进行异步处理，避免阻塞主线程
      requestAnimationFrame(() => {
        try {
          // 立即设置基本UI状态和处理状态
          setError(null)
          setProcessingCitySelect(city.name)
          setSearchInput(city.displayName)
          setPredictions([])
          setShowPredictions(false)
          setActivePredictionIndex(-1)

          // 使用 setTimeout 延迟非关键操作
          setTimeout(() => {
            const coords = {
              latitude: city.latitude,
              longitude: city.longitude,
              source: 'preset' as const,
              address: city.displayName,
            }

            setCurrentCoords(coords)
            setSearchInput(city.displayName)
            setPredictions([])
            setShowPredictions(false)
            setActivePredictionIndex(-1)

            // 批量处理回调
            requestAnimationFrame(() => {
              // 优先使用新的 onCitySelect 回调，确保坐标和时区同步更新
              if (onCitySelect) {
                onCitySelect({
                  latitude: city.latitude,
                  longitude: city.longitude,
                  timezone: city.timezone,
                  displayName: city.displayName,
                })
              } else {
                // 回退到分别调用（保持向后兼容）
                onLocationChange(city.displayName)
                onUseCurrentLocation({
                  latitude: city.latitude,
                  longitude: city.longitude,
                  source: 'preset',
                  address: city.displayName,
                })

                // If timezone change callback is provided, use it for immediate timezone update
                if (onTimezoneChange) {
                  onTimezoneChange(city.timezone)
                }
              }

              logger.info(`🏙️ 选择城市: ${city.displayName}`, {
                coordinates: `${city.latitude}, ${city.longitude}`,
                timezone: city.timezone,
              })

              // 性能监控（开发环境）
              if (process.env.NODE_ENV === 'development') {
                const duration = performance.now() - startTime
                if (duration > 100) {
                  logger.performance(
                    `[INP Warning] City selection took ${duration.toFixed(2)}ms`
                  )
                }
              }

              // 清除处理状态
              setProcessingCitySelect(null)
            })
          }, 0)
        } catch (error) {
          logger.error('Error in handlePopularCitySelect', error as Error)
          setError(locationErrors.selectCity)
          setProcessingCitySelect(null)
        }
      })
    },
    [onLocationChange, onUseCurrentLocation, onTimezoneChange, onCitySelect, locationErrors]
  )

  const geocodeAddress = useCallback(
    async (address: string) => {
      setError(null)
      try {
        const coordCheck = isCoordinates(address)
        if (coordCheck.isValid && coordCheck.coords) {
          const coords = {
            latitude: coordCheck.coords.lat,
            longitude: coordCheck.coords.lng,
            source: 'input' as const,
          }
          setCurrentCoords(coords)
          onUseCurrentLocation(coords)
          return
        }

        const response = await fetch(
          `/api/maps/geocode?address=${encodeURIComponent(address)}`
        )
        let data
        try {
          data = await response.json()
        } catch {
          if (!response.ok)
            throw new Error(
              `Geocoding request via proxy failed with status ${response.status}`
            )
          throw new Error('Failed to parse API response from geocodeAddress')
        }

        if (!response.ok)
          throw new Error(
            data.error ||
              data.details ||
              `Geocoding request via proxy failed with status ${response.status}`
          )

        if (data.status === 'OK' && data.results[0]) {
          const result = data.results[0]
          const { lat, lng } = result.geometry.location
          const coordsData = {
            latitude: lat,
            longitude: lng,
            source: 'geocode' as const,
            address: result.formatted_address,
          }
          setCurrentCoords(coordsData)
          onUseCurrentLocation(coordsData)
          onLocationChange(result.formatted_address)
          setSearchInput(result.formatted_address)
        } else {
          throw new Error(`Location not found or API error: ${data.status}`)
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Unknown error')
        logger.error('❌ 地理编码错误:', err)
        // 出错时设置默认坐标
        setError(locationErrors.locationNotFound)
      }
    },
    [onLocationChange, onUseCurrentLocation, locationErrors]
  )

  const handleSelectPrediction = useCallback(
    async (prediction: ApiAutocompletePrediction) => {
      setError(null)
      setSearchInput(prediction.description)
      setPredictions([])
      setShowPredictions(false)
      setActivePredictionIndex(-1)

      if (!prediction.place_id) {
        logger.error(
          'Place ID missing from prediction, falling back to geocodeAddress.',
          new Error('Missing place_id')
        )
        geocodeAddress(prediction.description)
        return
      }

      const currentTokenForDetails = sessionTokenRef.current
      sessionTokenRef.current = undefined

      try {
        let apiUrl = `/api/maps/placeDetails?placeid=${encodeURIComponent(prediction.place_id)}`
        if (currentTokenForDetails) {
          apiUrl += `&sessiontoken=${encodeURIComponent(currentTokenForDetails)}`
        }

        const response = await fetch(apiUrl)
        const placeDetails = await response.json()

        if (!response.ok) {
          throw new Error(
            placeDetails.error ||
              placeDetails.details ||
              'Failed to fetch place details via proxy'
          )
        }

        if (placeDetails.geometry && placeDetails.geometry.location) {
          const { lat, lng } = placeDetails.geometry.location
          const coords = {
            latitude: lat,
            longitude: lng,
            source: 'prediction' as const,
            address: placeDetails.formatted_address || prediction.description,
          }

          let displayAddress =
            placeDetails.formatted_address || prediction.description
          const components =
            placeDetails.address_components as AddressComponent[]
          const city =
            components.find(c => c.types.includes('locality'))?.long_name || ''
          const state =
            components.find(c =>
              c.types.includes('administrative_area_level_1')
            )?.long_name || ''
          const country =
            components.find(c => c.types.includes('country'))?.long_name || ''
          const customFormattedAddress = [city, state, country]
            .filter(Boolean)
            .join(', ')
          if (customFormattedAddress) displayAddress = customFormattedAddress

          setSearchInput(displayAddress)
          onLocationChange(displayAddress)
          setCurrentCoords(coords)
          onUseCurrentLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
          })
        } else {
          logger.error(
            'Place details from proxy missing geometry/location:',
            placeDetails
          )
          throw new Error('Could not retrieve location details from proxy.')
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        logger.error('Error fetching place details via proxy:', error)
        setError(locationErrors.fetchPlaceDetails)
      }
    },
    [onLocationChange, onUseCurrentLocation, geocodeAddress, locationErrors]
  )

  const fetchSuggestions = useCallback(
    async (
      inputValue: string,
      token: string | undefined,
      requestId: number
    ) => {
      if (!isLocationServiceReady) {
        setError(
          locationServiceError ||
            locationErrors.serviceNotReady
        )
        return
      }
      if (!token) {
        logger.error(
          'Attempted to fetch suggestions without a session token.',
          new Error('Missing session token')
        )
        return
      }

      if (requestId !== lastRequestIdRef.current) {
        return
      }

      if (activeAutocompleteRequestControllerRef.current) {
        activeAutocompleteRequestControllerRef.current.abort()
      }

      const controller = new AbortController()
      activeAutocompleteRequestControllerRef.current = controller

      const apiUrl = `/api/maps/autocomplete?input=${encodeURIComponent(inputValue)}&sessiontoken=${encodeURIComponent(token)}`

      try {
        const response = await fetch(apiUrl, { signal: controller.signal })

        if (activeAutocompleteRequestControllerRef.current === controller) {
          activeAutocompleteRequestControllerRef.current = null
        }

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.details ||
              `Failed to fetch suggestions via proxy (status: ${response.status})`
          )
        }

        if (requestId === lastRequestIdRef.current) {
          setPredictions(data.predictions || [])
          setShowPredictions(data.predictions && data.predictions.length > 0)
          setActivePredictionIndex(-1)
          setError(null)
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          // 请求被中断是正常行为，不需要显示错误
          return
        }

        const err = error instanceof Error ? error : new Error('Unknown error')
        logger.error('❌ 获取建议失败:', err)

        if (requestId === lastRequestIdRef.current) {
          setPredictions([])
          setShowPredictions(false)
          setError(locationErrors.fetchSuggestions)
        }
      } finally {
        if (activeAutocompleteRequestControllerRef.current === controller) {
          activeAutocompleteRequestControllerRef.current = null
        }
      }
    },
    [isLocationServiceReady, locationServiceError, locationErrors]
  )

  // 增加防抖延迟以减少 INP 问题
  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, 300), // 增加到 300ms 减少频繁 API 调用
    [fetchSuggestions]
  )

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const startTime = performance.now() // 性能监控开始

      const value = e.target.value
      setSearchInput(value)
      setError(null)

      // 性能优化：更严格的最小字符要求
      if (value.trim().length < 4) {
        // 从 3 增加到 4
        setPredictions([])
        setShowPredictions(false)
        setActivePredictionIndex(-1)
        if (activeAutocompleteRequestControllerRef.current) {
          activeAutocompleteRequestControllerRef.current.abort()
          activeAutocompleteRequestControllerRef.current = null
        }

        // 记录性能（开发环境）
        if (process.env.NODE_ENV === 'development') {
          const duration = performance.now() - startTime
          if (duration > 16) {
            // 超过一帧时间
            logger.performance(
              `[INP Warning] Input change took ${duration.toFixed(2)}ms`
            )
          }
        }
        return
      }

      const currentRequestId = ++lastRequestIdRef.current

      if (value.trim() === '' || isCoordinates(value).isValid) {
        setPredictions([])
        setShowPredictions(false)
        return
      }

      // 性能优化：延迟 API 调用
      setTimeout(async () => {
        if (!sessionTokenRef.current && !isFetchingToken) {
          await fetchNewSessionToken()
        }

        if (sessionTokenRef.current) {
          debouncedFetchSuggestions(
            value,
            sessionTokenRef.current,
            currentRequestId
          )
        } else {
          setError(
            locationServiceError ||
              locationErrors.suggestionsNotReady
          )
          setPredictions([])
          setShowPredictions(false)
        }

        // 记录性能（开发环境）
        if (process.env.NODE_ENV === 'development') {
          const duration = performance.now() - startTime
          if (duration > 50) {
            // 超过 50ms 认为慢
            logger.performance(
              `[INP Warning] Full input processing took ${duration.toFixed(2)}ms`
            )
          }
        }
      }, 16) // 延迟一帧，让 UI 更新先完成
    },
    [
      fetchNewSessionToken,
      debouncedFetchSuggestions,
      locationServiceError,
      isFetchingToken,
      locationErrors,
    ]
  )

  const handleGetLocation = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    if (!navigator.geolocation) {
      setError(locationErrors.geolocationNotSupported)
      setIsLoading(false)
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          })
        }
      )
      const { latitude, longitude } = position.coords

      const response = await fetch(
        `/api/maps/geocode?latlng=${latitude},${longitude}`
      )
      let data
      try {
        data = await response.json()
      } catch {
        if (!response.ok)
          throw new Error(
            `Reverse geocoding via proxy failed with status ${response.status}`
          )
        throw new Error('Failed to parse API response from handleGetLocation')
      }
      if (!response.ok)
        throw new Error(
          data.error ||
            data.details ||
            `Reverse geocoding via proxy failed with status ${response.status}`
        )

      if (data.status === 'OK' && data.results[0]) {
        const place = data.results[0]
        const addressComponents = place.address_components
        const addrComps = addressComponents as AddressComponent[]
        const city =
          addrComps.find(c => c.types.includes('locality'))?.long_name || ''
        const state =
          addrComps.find(c => c.types.includes('administrative_area_level_1'))
            ?.long_name || ''
        const country =
          addrComps.find(c => c.types.includes('country'))?.long_name || ''
        const formattedAddress = [city, state, country]
          .filter(Boolean)
          .join(', ')

        setSearchInput(formattedAddress)
        onLocationChange(formattedAddress)
        setCurrentCoords({
          latitude,
          longitude,
          source: 'browser' as const,
          address: formattedAddress,
        })
        onUseCurrentLocation({ latitude, longitude })
      } else {
        throw new Error(`No results found for current location: ${data.status}`)
      }
    } catch (err: unknown) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(locationErrors.permissionDenied)
            break
          case err.POSITION_UNAVAILABLE:
            setError(
              locationErrors.positionUnavailable
            )
            break
          case err.TIMEOUT:
            setError(
              locationErrors.requestTimeout
            )
            break
          default:
            setError(
              locationErrors.unknownError
            )
        }
      } else {
        const error = err instanceof Error ? err : new Error('Unknown error')
        logger.error('Failed to get location from browser API', error)
        setError(
          locationErrors.getLocation
        )
      }
    } finally {
      setIsLoading(false)
    }
  }, [onLocationChange, onUseCurrentLocation, locationErrors])

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showPredictions && predictions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setActivePredictionIndex(
            prevIndex => (prevIndex + 1) % predictions.length
          )
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setActivePredictionIndex(
            prevIndex =>
              (prevIndex - 1 + predictions.length) % predictions.length
          )
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (
            activePredictionIndex >= 0 &&
            predictions[activePredictionIndex]
          ) {
            handleSelectPrediction(predictions[activePredictionIndex])
          } else if (searchInput.trim()) {
            geocodeAddress(searchInput)
            setShowPredictions(false)
            setPredictions([])
            setActivePredictionIndex(-1)
            debouncedFetchSuggestions.cancel()
            if (activeAutocompleteRequestControllerRef.current) {
              activeAutocompleteRequestControllerRef.current.abort()
              activeAutocompleteRequestControllerRef.current = null
            }
            lastRequestIdRef.current++
          }
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setShowPredictions(false)
          setActivePredictionIndex(-1)
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (searchInput.trim()) {
          geocodeAddress(searchInput)
          setShowPredictions(false)
          setPredictions([])
          setActivePredictionIndex(-1)
          debouncedFetchSuggestions.cancel()
          if (activeAutocompleteRequestControllerRef.current) {
            activeAutocompleteRequestControllerRef.current.abort()
            activeAutocompleteRequestControllerRef.current = null
          }
          lastRequestIdRef.current++
        }
      }
    },
    [
      showPredictions,
      predictions,
      activePredictionIndex,
      handleSelectPrediction,
      searchInput,
      geocodeAddress,
      debouncedFetchSuggestions,
    ]
  )

  // Handle clicks outside of the input and prediction list to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        const predictionsList = document.getElementById('predictions-list')
        if (
          predictionsList &&
          !predictionsList.contains(event.target as Node)
        ) {
          setShowPredictions(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getCoordinatesMessage = () => {
    if (!currentCoords) return null
    const lat = currentCoords.latitude.toFixed(4)
    const lng = currentCoords.longitude.toFixed(4)
    return t(calculatorMessages.coordinatesLabel, { longitude: lng, latitude: lat })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {calculatorMessages.locationLabel}
        </label>
        {/* Popular cities quick buttons - always show for easy access */}
        <div className="flex items-center gap-1">
          {POPULAR_CITIES.map(city => {
            const isProcessing = processingCitySelect === city.name
            const isSelected = getCurrentSelectedCity === city.name
            return (
              <button
                key={city.name}
                onClick={() => handlePopularCitySelect(city)}
                disabled={isProcessing}
                className={`px-2.5 py-1 text-xs font-medium
                         ${
                           isProcessing
                             ? 'text-purple-400 bg-purple-100 cursor-wait'
                             : isSelected
                               ? 'text-white bg-purple-600 dark:bg-purple-500 shadow-md ring-2 ring-purple-400 dark:ring-purple-300'
                               : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                         }
                         rounded-md transition-all duration-200 ease-in-out
                         border ${isSelected ? 'border-purple-600 dark:border-purple-500' : 'border-purple-200 dark:border-purple-700'}
                         focus:outline-none focus:ring-2 focus:ring-purple-500/30
                         ${!isProcessing && !isSelected && 'active:bg-purple-200 dark:active:bg-purple-800 active:scale-95'}
                         ${!isSelected && 'hover:scale-105'} transform
                         will-change-transform touch-manipulation
                         disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100`}
                type="button"
                aria-label={t(calculatorMessages.switchToCity, { city: city.displayName })}
                aria-pressed={isSelected}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="opacity-25"
                      />
                      <path
                        fill="currentColor"
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {city.name}
                  </span>
                ) : (
                  city.name
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id="location"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500
                   transition-all duration-200 pl-4 pr-10
                   placeholder:text-gray-500 dark:placeholder:text-gray-400"
          placeholder={calculatorMessages.locationPlaceholder}
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            if (searchInput.trim() && predictions.length > 0)
              setShowPredictions(true)
            if (!sessionTokenRef.current && !isFetchingToken) {
              fetchNewSessionToken()
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              if (
                document.activeElement &&
                inputRef.current &&
                !inputRef.current.parentElement?.contains(
                  document.activeElement
                )
              ) {
                setShowPredictions(false)
              }
            }, 200)
          }}
          autoComplete="off"
          data-testid="location-input"
        />
        {showPredictions && predictions.length > 0 && (
          <ul
            id="predictions-list"
            className="absolute z-10 w-full left-0 right-0 bg-white dark:bg-gray-800
                     border border-gray-300 dark:border-gray-600 rounded-md shadow-lg mt-1
                     max-h-60 overflow-y-auto"
            tabIndex={0}
            role="listbox"
            aria-activedescendant={
              activePredictionIndex >= 0
                ? `prediction-item-${activePredictionIndex}`
                : undefined
            }
          >
            {predictions.map((prediction, index) => (
              <li
                key={prediction.place_id || index}
                id={`prediction-item-${index}`}
                role="option"
                aria-selected={index === activePredictionIndex}
                className={`px-4 py-2 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/20
                          ${index === activePredictionIndex ? 'bg-purple-100 dark:bg-purple-900/20' : ''}
                          text-sm truncate text-gray-900 dark:text-gray-100`}
                onMouseDown={() => handleSelectPrediction(prediction)}
              >
                {prediction.description}
              </li>
            ))}
            <li className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 text-right">
              {calculatorMessages.poweredByGoogle}
            </li>
          </ul>
        )}
        <button
          onClick={handleGetLocation}
          disabled={isLoading}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2
                    ${isLoading ? 'text-purple-400' : 'text-gray-400 hover:text-purple-500 dark:text-gray-500 dark:hover:text-purple-400'}
                    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30
                    rounded-full p-1 hover:scale-105 active:scale-95`}
          aria-label={calculatorMessages.useCurrentLocation}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <MapPin size={18} />
          )}
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 mt-1 animate-fade-in flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      {currentCoords && !error && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 animate-fade-in">
          {getCoordinatesMessage()}
        </div>
      )}
    </div>
  )
}

export const EnhancedLocationInput = memo(EnhancedLocationInputComponent)
