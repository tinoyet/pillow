declare const UCharts: import('vue').DefineComponent<{
  canvasId: string
  type: string
  chartData: {
    categories?: string[]
    series: any[]
  }
  opts?: any
}>
export default UCharts
