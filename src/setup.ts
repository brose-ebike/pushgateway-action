import * as core from '@actions/core';
import { STATE_START_TIME } from './constants';


async function main() {
    core.saveState(STATE_START_TIME, Date.now())
}
main().catch((error) => {
    core.setFailed(error.message);
})