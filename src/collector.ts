import * as core from '@actions/core';
import * as github from '@actions/github';
import { STATE_START_TIME } from './constants';

export function stateToValue(state: string): number {
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

export async function collect(status: string): Promise<Metric[]> {
    const labels = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        workflow: github.context.workflow,
    }
    const metrics: Metric[] = [];
    // Current Timestamp
    metrics.push({
        name: "github_actions_workflow_timestamp",
        type: "counter",
        description: null,
        labels: { ...labels },
        value: Date.now() / 1000.0,
    })
    // Workflow State
    metrics.push({
        name: "github_actions_workflow_state",
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