import * as core from "@actions/core";
import axios from "axios";

/**
 * The main function for the action.
 */
export async function run(): Promise<any> {
    try {
        const filesContent: string = core.getInput("files_content");
        const fileHeaderRegex: RegExp = /=+\s(?<trackingPlanId>tp_\w+)\.(?<trackingPlanSlug>[\w-]+)\.json\s=+/gi;

        core.debug(`Files content length: ${filesContent.length}.`);
        const filesRows = filesContent.split("\n");

        let currentTrackingPlanId = "";
        let currentTrackingPlanSlug = "";
        let files: {[trackingPlanId: string]: {slug: string, content: string[]}} = {};

        for (let row of filesRows) {
            const match = fileHeaderRegex.exec(row);
            if (match) {
                core.debug(`Match found: ${match[1]}`);

                currentTrackingPlanId = match.groups?.trackingPlanId || "";
                currentTrackingPlanSlug = match.groups?.trackingPlanSlug || "";

                files[currentTrackingPlanId] = {
                    slug: currentTrackingPlanSlug,
                    content: []
                };
                continue;
            }

            if (currentTrackingPlanId) {
                files[currentTrackingPlanId].content.push(row);
            }
        }

        for (let [trackingPlanId, {slug, content}] of Object.entries(files)) {
            const parsedTrackingPlan = JSON.parse(content.join("\n"));
            core.debug(`Parsed tracking plan ${trackingPlanId} (${slug}): ${JSON.stringify(parsedTrackingPlan)}`);

            // Send to Segment
            const response = await axios.patch(
                `https://api.segmentapis.com/tracking-plans/${trackingPlanId}`, 
                parsedTrackingPlan, 
                {
                    headers: {
                        "Content-Type": "application/vnd.segment.v1+json",
                        "Accept": "application/vnd.segment.v1+json",
                        Authorization: `Bearer ${process.env.SEGMENT_API_KEY}`
                    }
                }
            );

            core.debug(`Response from Segment: ${JSON.stringify(response.data)}`);
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
