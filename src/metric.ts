interface Metric {
    name: string
    type: "counter" | "gauge" | null
    description: string | null
    labels: { [key: string]: string },
    value: number,
}