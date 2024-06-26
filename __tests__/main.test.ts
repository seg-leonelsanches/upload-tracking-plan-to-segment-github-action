import * as core from "@actions/core";

import * as main from "../src/main";

// Mock the action's main function
const runMock = jest.spyOn(main, "run");

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/;

// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>;
let errorMock: jest.SpiedFunction<typeof core.error>;
let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>;

describe("Action", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        debugMock = jest.spyOn(core, "debug").mockImplementation();
        errorMock = jest.spyOn(core, "error").mockImplementation();
        getInputMock = jest.spyOn(core, "getInput").mockImplementation();
        setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
        setOutputMock = jest.spyOn(core, "setOutput").mockImplementation();
    });

    it("Trivial - Success case", async () => {
        // Set the action's inputs as return values from core.getInput()
        process.env.SEGMENT_API_KEY = "test";
        getInputMock.mockImplementation((name) => {
            switch (name) {
                case "files_content":
                    return [
                        "=========================== tp_2eI1Qp3KVbQxyJmlS2GGX4xkdQd.my-first-tracking-plan.json ==========================",
                        `{`,
                        `  "properties": {`,
                        `    "context": {},`,
                        `    "traits": {},`,
                        `    "properties": {}`,
                        `  }`,
                        `}`
                    ].join("\n");
                default:
                    return "";
            }
        });

        await main.run();
        expect(runMock).toHaveReturned();

        // Verify that all of the core library functions were called correctly
        /* expect(debugMock).toHaveBeenNthCalledWith(
            1,
            "Waiting 500 milliseconds ..."
        );
        expect(debugMock).toHaveBeenNthCalledWith(
            2,
            expect.stringMatching(timeRegex)
        );
        expect(debugMock).toHaveBeenNthCalledWith(
            3,
            expect.stringMatching(timeRegex)
        );
        expect(setOutputMock).toHaveBeenNthCalledWith(
            1,
            "time",
            expect.stringMatching(timeRegex)
        ); */
        expect(errorMock).not.toHaveBeenCalled();
    });
});
