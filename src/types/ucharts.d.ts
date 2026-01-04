declare module '@qiun/ucharts' {
  interface UChartsOptions {
    type: string
    context: any
    width: number
    height: number
    categories?: string[]
    series: any[]
    animation?: boolean
    background?: string
    padding?: number[]
    xAxis?: any
    yAxis?: any
    legend?: any
    extra?: any
    [key: string]: any
  }

  class uCharts {
    constructor(options: UChartsOptions)
    updateData(data: { categories?: string[]; series: any[] }): void
    scrollStart(e: any): void
    scroll(e: any): void
    scrollEnd(e: any): void
    touchLegend(e: any): void
  }

  export default uCharts
}
