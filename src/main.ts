import * as core from "@actions/core";

export async function run(): Promise<any> {
    try {
        const filesContent: string = core.getInput("files_content");
        const fileHeaderRegex: RegExp = /=+\s(tp_\w+)\.[\w-]+\.json\s=+/gi;

        core.debug(`Files content length: ${filesContent.length}.`);
        const filesRows = filesContent.split("\n");

        for (let row of filesRows) {
            const match = fileHeaderRegex.exec(row);
            if (match) {
                core.debug(`Match found: ${match[1]}`);
            }
        }

        // Log the current timestamp, wait, then log the new timestamp
        // core.debug(new Date().toTimeString());
        // await wait(parseInt(ms, 10));
        // core.debug(new Date().toTimeString());

        // Set outputs for other workflow steps to use
        core.setOutput("results", new Date().toTimeString());
    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) core.setFailed(error.message);
    }
}
