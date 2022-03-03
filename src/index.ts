import * as core from '@actions/core';
import * as github from '@actions/github';
import fetch from 'node-fetch';
import { collect } from './collector';
import { serialize } from './serializer';

async function send(url: string, username: string, password: string, metrics: Metric[]) {
    let headers = {}
    if (username != "" && password != "") {
        core.debug(`Enabled Basic Authentication`)
        const credentials = Buffer.from(`${username}:${password}`).toString('base64')
        headers = { ...headers, "Authorization": `Basic ${credentials}` }
    }
    const body = metrics.map(serialize).join("\n") + "\n"
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