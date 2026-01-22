const voxNum = 'YOUR_RENTED_PHONE_NUMBER';

VoxEngine.addEventListener(AppEvents.Started, async ({ e }) => {
    let voiceAgentAPIClient = undefined;

    const { clientNum } = JSON.parse(VoxEngine.customData());

    const outCall = VoxEngine.callPSTN(clientNum, voxNum);

    outCall.addEventListener(CallEvents.Connected, async () => {
        Logger.write('outCall Connected');
        try {
            voiceAgentAPIClient = await createGrokVoiceAgent(outCall);
        } catch (error) {
            Logger.write('===SOMETHING_WENT_WRONG===');
            Logger.write(error);
            VoxEngine.terminate();
        }
    });

    const callBaseHandler = () => {
        if (voiceAgentAPIClient) voiceAgentAPIClient.close();
        VoxEngine.terminate();
    };

    outCall.addEventListener(CallEvents.Disconnected, callBaseHandler);
    outCall.addEventListener(CallEvents.Failed, callBaseHandler);

});
