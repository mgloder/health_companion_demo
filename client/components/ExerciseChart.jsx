import React, { useRef, useEffect } from "react";
import * as echarts from "echarts";

const ExerciseChart = () => {
  const chartRef = useRef(null);
  let chartInstance = null;

  // ECharts 配置项
  const option = {
    grid: {
      top: 4, // 上边距
      right: 0, // 右边距
      bottom: 4, // 下边距
      left: 0, // 左边距
      containLabel: true, // 确保轴标签在 grid 区域内
    },
    title: {
      show: false,
    },
    legend: {
      show: false,
    },
    xAxis: {
      axisLabel: {
        inside: false,
        color: '#716FAD47'
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
      axisLine: {
        show: false
      },
      min: 0,
      position: "right",
      interval: 30,
      axisLabel: {
        formatter: (value) => {
          const hours = (value / 60).toFixed(1);
          if (hours % 1 === 0) {
            return `${Math.trunc(hours)}h`
          }
        },
        showMinLabel: false,
        showMaxLabel: false,
        color: '#999999'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#0000000F',
          width: '0.5'
        },
      },
    },
    series: [
      {
        name: "minutes",
        type: "bar",
        data: [40, 140, 90, 100, 20, 70, 5],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#3660F9" },
            { offset: 1, color: "#3660F92B" },
          ]),
        },
        emphasis: {
          disabled: true,
        },
      },
    ],
  };

  // 初始化图表
  useEffect(() => {
    if (chartRef.current) {
      // 初始化 ECharts 实例
      chartInstance = echarts.init(chartRef.current);

      // 设置配置项
      chartInstance.setOption(option);
    }

    // 组件卸载时销毁图表
    return () => {
      if (chartInstance) {
        chartInstance.dispose();
      }
    };
  }, []); // 空依赖数组表示只在组件挂载时运行

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", height: "10rem" }}
    />
  );
};

export default ExerciseChart;
