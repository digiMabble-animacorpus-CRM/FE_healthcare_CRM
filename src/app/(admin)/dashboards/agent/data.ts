import { currency } from '@/context/constants'
import { ApexOptions } from 'apexcharts'

export type StatType = {
  title: string
  amount: string
  icon: string
  change?: number
  variant: string
}

export type RevenueType = {
  title: string
  amount: string
  variant: string
  progress: number
}

export type CountryType = {
  country: string
  progress: number
  view: number
  icon: string
  variant: string
}

export const statData: StatType[] = [
  {
    title: 'Earn of the Month',
    amount: `${currency}3548.09`,
    icon: 'solar:calendar-date-broken',
    variant: 'primary',
  },
  {
    title: 'Earn Growth',
    amount: `${currency}67435`,
    icon: 'solar:graph-new-broken',
    change: 44,
    variant: 'success',
  },
  {
    title: 'Conversation Rate',
    amount: '78.8%',
    icon: 'solar:user-plus-broken',
    variant: 'warning',
  },
  {
    title: 'Gross Profit Margin',
    amount: '34.00%',
    icon: 'solar:chart-2-broken',
    variant: 'info',
  },
]

export const revenueData: RevenueType[] = [
  {
    title: 'Rent',
    amount: `${currency}12,223.78`,
    progress: 40,
    variant: 'primary',
  },
  {
    title: 'Sales',
    amount: `${currency}56,131`,
    progress: 30,
    variant: 'warning',
  },
  {
    title: 'Broker Deal',
    amount: `${currency}1,340.15`,
    progress: 20,
    variant: 'success',
  },
  {
    title: 'Market',
    amount: `${currency}600.46`,
    progress: 20,
    variant: 'info',
  },
]

export const countryData: CountryType[] = [
  {
    country: 'Brussels',
    progress: 82.05,
    view: 659,
    icon: 'circle-flags:be',
    variant: 'secondary',
  },
  {
    country: 'Wallonia',
    progress: 70.5,
    view: 485,
    icon: 'circle-flags:be',
    variant: 'info',
  },
  {
    country: 'Flanders',
    progress: 65.8,
    view: 355,
    icon: 'circle-flags:be',
    variant: 'warning',
  },
  // { €
  //   country: 'Canada',
  //   progress: 55.8,
  //   view: 204,
  //   icon: 'circle-flags:ca',
  //   variant: 'success',
  // },
]

export const salesFunnelOptions: ApexOptions = {
  chart: {
    type: 'area',
    height: 165,
    sparkline: {
      enabled: true,
    },
  },
  series: [
    {
      data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54],
    },
  ],
  stroke: {
    width: 2,
    curve: 'smooth',
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      opacityFrom: 0.4,
      opacityTo: 0,
      stops: [0, 100],
    },
  },

  markers: {
    size: 0,
  },
  colors: ['#caaa71'],
  tooltip: {
    fixed: {
      enabled: false,
    },
    x: {
      show: false,
    },
    y: {
      title: {
        formatter: function (seriesName) {
          return ''
        },
      },
    },
    marker: {
      show: false,
    },
  },
}

export const agentOptions: ApexOptions = {
  series: [
    {
      name: 'Property Sales',
      type: 'bar',
      data: [89.25, 98.58, 68.74, 108.87, 77.54, 84.03, 51.24, 28.57, 92.57, 42.36, 88.51, 36.57],
    },
    {
      name: 'Profit Ratio',
      type: 'line',
      data: [35, 35, 25, 25, 45, 45, 75, 75, 45, 45, 54, 54],
    },
  ],
  chart: {
    height: 330,
    type: 'line',
    toolbar: {
      show: false,
    },
  },
  stroke: {
    curve: 'straight',
    dashArray: [0, 8],
    width: [0, 2],
  },
  fill: {
    opacity: [4, 1],
  },
  markers: {
    size: [0, 0],
    strokeWidth: 2,
    hover: {
      size: 4,
    },
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    axisTicks: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
  },
  grid: {
    show: true,
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: false,
      },
    },
    padding: {
      top: 0,
      right: -2,
      bottom: 15,
      left: 10,
    },
  },
  legend: {
    show: false,
  },
  plotOptions: {
    bar: {
      columnWidth: '30%',
      barHeight: '100%',
      borderRadius: 8,
    },
  },
  colors: ['#caaa71', '#f8ac59'],
  tooltip: {
    shared: true,
    y: [
      {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return y.toFixed(0)
          }
          return y
        },
      },
      {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return '€' + y.toFixed(2) + 'k'
          }
          return y
        },
      },
      {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return y.toFixed(0) + ' Sales'
          }
          return y
        },
      },
    ],
  },
}

export const goalsOptions: ApexOptions = {
  chart: {
    height: 300,
    type: 'radialBar',
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      dataLabels: {
        name: {
          fontSize: '16px',
          color: undefined,
          offsetY: 120,
        },
        value: {
          offsetY: 76,
          fontSize: '22px',
          color: undefined,
          formatter: function (val) {
            return val + '%'
          },
        },
      },
      track: {
        background: 'rgba(170,184,197, 0.4)',
        margin: 0,
      },
    },
  },
  fill: {
    gradient: {
      shade: 'dark',
      shadeIntensity: 0.2,
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 50, 65, 91],
    },
  },
  stroke: {
    dashArray: 4,
  },
  colors: ['#caaa71'],
  series: [75],
  labels: ['Achieved'],
  responsive: [
    {
      breakpoint: 380,
      options: {
        chart: {
          height: 280,
        },
      },
    },
  ],
}
