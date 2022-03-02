import * as core from '@actions/core';
import * as github from '@actions/github';
import fetch from 'node-fetch';
import { STATE_START_TIME } from './constants';

interface Metric {
    name: string
    type: "counter" | "gauge" | null
    description: string | null
    labels: { [key: string]: string },
    value: number,
}

function stateToValue(state: string): number {
    switch (state) {
        case "success":
            return 0
        case "failure":
            return 1
        case "cancelled":
            return 2
        default:
            return 99
    }
}

async function collect(status: string): Promise<Metric[]> {
    const labels = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        workflow: github.context.workflow,
    }
    const metrics: Metric[] = [];
    // Current Timestamp
    metrics.push({
        name: "github_action_workflow_timestamp",
        type: "counter",
        description: null,
        labels: { ...labels },
        value: Date.now() / 1000.0,
    })
    // Workflow State
    metrics.push({
        name: "github_action_workflow_state",
        type: "gauge",
        description: null,
        labels: { ...labels },
        value: stateToValue(status)
    })
    // Workflow duration
    metrics.push({
        name: "github_action_workflow_duration",
        type: "gauge",
        description: null,
        labels: { ...labels },
        value: (Date.now() - parseInt(core.getState(STATE_START_TIME))) / 1000.0
    })
    return metrics
}

function metricToString(metric: Metric): string {
    let result = `# TYPE ${metric.name} ${metric.type}\n`
    if (metric.description != null) {
        result += `# HELP ${metric.description}\n`
    }
    result += `${metric.name} ${metric.value}`
    return result
}

async function send(url: string, username: string, password: string, metrics: Metric[]) {
    let headers = {}
    if (username != "" && password != "") {
        core.debug(`Enabled Basic Authentication`)
        const credentials = Buffer.from(`${username}:${password}`).toString('base64')
        headers = { ...headers, "Authorization": `Basic ${credentials}` }
    }
    const body = metrics.map(metricToString).join("\n") + "\n"
    const result = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body
    })
    const responseBody = await result.text()
    core.debug(`POST ${url}\nBody:\n${body}\n\n\nStatus: ${result.status}, Body: ${responseBody}`)
    if (result.status > 399) {
        core.error(`Received error result, Status: ${result.status}, Body: ${responseBody}`)
        core.setFailed("Unable to record metrics")
    }
}

async function main() {
    // Input
    const url = core.getInput('url');
    const status = core.getInput('status');
    const username = core.getInput('username');
    const password = core.getInput('password');
    // Calculated Values
    const metrics = await collect(status)
    core.debug(`Created ${metrics.length} Metrics`)
    await send(url, username, password, metrics)
    core.debug(`Finished Recording`)
}
main().catch((error) => {
    core.setFailed(error.message);
})