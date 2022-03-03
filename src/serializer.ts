

export async function serialize(metric: Metric): Promise<string> {
    let result = `# TYPE ${metric.name} ${metric.type}\n`
    if (metric.description != null) {
        result += `# HELP ${metric.description}\n`
    }
    let labels = ""
    if (Object.keys(metric.labels).length > 0) {
        const result = []
        for (const key in metric.labels) {
            result.push(`${key}="${metric.labels[key]}"`)
        }
        labels = `{${result.join(",")}}`
    }
    result += `${metric.name}${labels} ${metric.value}`
    return result
}