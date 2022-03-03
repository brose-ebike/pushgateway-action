import * as core from '@actions/core';
import * as github from '@actions/github';
import fetch from 'node-fetch';
import { collect } from './collector';
import { serialize } from './serializer';

function base64encode(data: string): string {
    return Buffer.from(data).toString('base64')
}

function appendLabelsToUrl(url: string): string {
    const labels: any = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        workflow: github.context.workflow,
    }

    let result = url;
    if (!result.endsWith("/")) {
        result += "/"
    }
    for (const key in labels) {
        result += `${key}@base64/${base64encode(labels[key])}/`
    }
    return result
}

async function send(url: string, username: string, password: string, metrics: Metric[]) {
    let headers = {}
    if (username != "" && password != "") {
        core.debug(`Enabled Basic Authentication`)
        const credentials = base64encode(`${username}:${password}`)
        headers = { ...headers, "Authorization": `Basic ${credentials}` }
    }
    const body = (await Promise.all(metrics.map(serialize))).join("\n") + "\n"
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
    let fullUrl = appendLabelsToUrl(url)
    await send(fullUrl, username, password, metrics)
    core.debug(`Finished Recording`)
}
main().catch((error) => {
    core.setFailed(error.message);
})