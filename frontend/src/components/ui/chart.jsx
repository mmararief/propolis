import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" }

const ChartContext = React.createContext({
  config: {},
  label: "",
})

function ChartContainer({
  id,
  className,
  children,
  config: configProp,
  ...props
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  const config = configProp || {}

  return (
    <ChartContext.Provider value={{ config, label: chartId }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }) {
  const colorConfig = Object.entries(config).filter(
    ([, value]) => value.theme || value.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, value]) => {
    const color = value.theme?.[theme] || value.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  nameKey,
  labelKey,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  ...props
}) {
  const { config } = React.useContext(ChartContext)

  const tooltipLabel = React.useMemo(() => {
    if (label !== undefined) {
      return label
    }
    if (!payload?.length) {
      return ""
    }

    const item = payload[0]
    const key = `${labelKey || item.dataKey || item.name || "value"}`
    const itemConfig = config[key]

    if (
      itemConfig?.label !== undefined &&
      typeof itemConfig.label === "string"
    ) {
      return itemConfig.label
    }

    if (labelFormatter) {
      return labelFormatter(item.payload)
    }

    if (item.name) {
      return item.name
    }

    return ""
  }, [
    label,
    labelFormatter,
    labelKey,
    payload,
    config,
  ])

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "grid gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm shadow-md",
        className
      )}
      {...props}
    >
      {label ? (
        <div className={cn("font-medium", labelClassName)}>
          {tooltipLabel}
        </div>
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.dataKey || item.name || "value"}`
          const itemConfig = config[key]
          const indicatorColor = color || item.payload.fill || item.color

          return (
            <div
              key={item.dataKey}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-slate-700",
                itemConfig?.className
              )}
            >
              {indicator === "dot" && (
                <div
                  className="shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                  style={
                    {
                      backgroundColor: indicatorColor,
                      borderColor: indicatorColor,
                      "--color-bg": indicatorColor,
                      "--color-border": indicatorColor,
                    }
                  }
                />
              )}
              {indicator === "line" && (
                <div
                  className="shrink-0 border-2 border-[--color-border]"
                  style={{
                    borderColor: indicatorColor,
                    "--color-border": indicatorColor,
                  }}
                />
              )}
              <div
                className={cn(
                  "flex flex-1 justify-between leading-none",
                  itemConfig?.labelClassName
                )}
              >
                <div className="grid gap-1.5">
                  <span className="text-slate-500">
                    {itemConfig?.label || item.name}
                  </span>
                  {formatter ? (
                    formatter(item.value, item.payload, index)
                  ) : (
                    <span className="font-medium text-slate-900">
                      {typeof item.value === "number"
                        ? item.value.toLocaleString()
                        : item.value}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
  ...props
}) {
  const { config } = React.useContext(ChartContext)

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
      {...props}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = config[key]

        return (
          <div
            key={item.value}
            className={cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-slate-700",
              itemConfig?.className
            )}
          >
            {!hideIcon && (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.icon && <itemConfig.icon />}
            <span className="text-slate-500">{itemConfig?.label || item.value}</span>
          </div>
        )
      })}
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}

