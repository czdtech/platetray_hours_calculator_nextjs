#!/bin/bash

echo "🚀 行星时计算器性能测试"
echo "=================================="

URL="http://localhost:3000"
TESTS=5

echo "📊 测试URL: $URL"
echo "🔄 测试次数: $TESTS"
echo ""

# 检查服务器是否运行
if ! curl -s --head "$URL" > /dev/null; then
    echo "❌ 服务器未运行，请先启动: npm run dev"
    exit 1
fi

echo "✅ 服务器正在运行"
echo ""

# 性能测试函数
run_performance_test() {
    local test_name="$1"
    local url="$2"
    
    echo "📈 测试: $test_name"
    echo "-------------------"
    
    local total_time=0
    local total_size=0
    local min_time=999999
    local max_time=0
    
    for i in $(seq 1 $TESTS); do
        echo -n "  测试 $i/$TESTS: "
        
        # 使用curl测量时间和大小
        local result=$(curl -w "@-" -s -o /dev/null "$url" <<'EOF'
{
  "time_total": %{time_total},
  "time_namelookup": %{time_namelookup},
  "time_connect": %{time_connect},
  "time_appconnect": %{time_appconnect},
  "time_pretransfer": %{time_pretransfer},
  "time_redirect": %{time_redirect},
  "time_starttransfer": %{time_starttransfer},
  "size_download": %{size_download},
  "speed_download": %{speed_download}
}
EOF
)
        
        if [ $? -eq 0 ]; then
            local time_total=$(echo "$result" | grep -o '"time_total": [0-9.]*' | cut -d' ' -f2)
            local time_starttransfer=$(echo "$result" | grep -o '"time_starttransfer": [0-9.]*' | cut -d' ' -f2)
            local size_download=$(echo "$result" | grep -o '"size_download": [0-9.]*' | cut -d' ' -f2)
            
            # 转换为毫秒
            local time_ms=$(echo "$time_total * 1000" | bc -l | cut -d. -f1)
            local ttfb_ms=$(echo "$time_starttransfer * 1000" | bc -l | cut -d. -f1)
            
            echo "${time_ms}ms (TTFB: ${ttfb_ms}ms, Size: ${size_download}B)"
            
            total_time=$(echo "$total_time + $time_ms" | bc -l)
            total_size=$(echo "$total_size + $size_download" | bc -l)
            
            # 更新最小/最大时间
            if [ $(echo "$time_ms < $min_time" | bc -l) -eq 1 ]; then
                min_time=$time_ms
            fi
            if [ $(echo "$time_ms > $max_time" | bc -l) -eq 1 ]; then
                max_time=$time_ms
            fi
        else
            echo "失败"
        fi
        
        # 短暂延迟避免缓存影响
        sleep 1
    done
    
    # 计算平均值
    local avg_time=$(echo "scale=0; $total_time / $TESTS" | bc -l)
    local avg_size=$(echo "scale=0; $total_size / $TESTS" | bc -l)
    
    echo ""
    echo "📊 统计结果:"
    echo "  平均加载时间: ${avg_time}ms"
    echo "  最快加载时间: ${min_time}ms"
    echo "  最慢加载时间: ${max_time}ms"
    echo "  平均页面大小: ${avg_size}B ($(echo "scale=1; $avg_size / 1024" | bc -l)KB)"
    echo ""
    
    # 性能评级
    if [ $(echo "$avg_time < 1000" | bc -l) -eq 1 ]; then
        echo "🟢 性能评级: 优秀 (< 1秒)"
    elif [ $(echo "$avg_time < 2000" | bc -l) -eq 1 ]; then
        echo "🟡 性能评级: 良好 (1-2秒)"
    elif [ $(echo "$avg_time < 3000" | bc -l) -eq 1 ]; then
        echo "🟠 性能评级: 一般 (2-3秒)"
    else
        echo "🔴 性能评级: 需要优化 (> 3秒)"
    fi
    echo ""
}

# 运行测试
run_performance_test "优化版本 (CalculatorPageOptimized)" "$URL"

# 生成简单报告
echo "📋 性能测试完成!"
echo "=================================="
echo "测试时间: $(date)"
echo "测试环境: 本地开发服务器"
echo "网络条件: 本地网络"
echo ""
echo "💡 优化建议:"
echo "1. 如果加载时间 > 2秒，考虑进一步优化"
echo "2. 监控生产环境的实际性能"
echo "3. 使用浏览器开发工具分析详细指标"
echo "4. 考虑添加Service Worker缓存" 