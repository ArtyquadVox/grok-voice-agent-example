VoxEngine.addEventListener(AppEvents.CallAlerting, async ({ call }) => {
    let voiceAgentAPIClient = undefined;

    call.answer();

    const callBaseHandler = () => {
        if (voiceAgentAPIClient) voiceAgentAPIClient.close();
        VoxEngine.terminate();
    };

    call.addEventListener(CallEvents.Disconnected, callBaseHandler);
    call.addEventListener(CallEvents.Failed, callBaseHandler);

    try {
        voiceAgentAPIClient = await createGrokVoiceAgent(call);
    } catch (error) {
        Logger.write('===SOMETHING_WENT_WRONG===');
        Logger.write(error);
        VoxEngine.terminate();
    }
});
