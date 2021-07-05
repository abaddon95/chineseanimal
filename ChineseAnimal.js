const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const Alexa = require('ask-sdk');
let skill;

exports.handler = async function (event, context) {
    //console.log('REQUEST ' + JSON.stringify(event));
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
            .addErrorHandlers(ErrorHandler)
            .addRequestHandlers(
                LaunchRequestHandler,
                ChineseAnimalIntentHandler
                // add custom Intent handlers
            ).create();
    }

    const response = await skill.invoke(event, context);
    //console.log('RESPONSE :' + JSON.stringify(response));
    return response;
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to my chinese zodiac animal';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const ChineseAnimalIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ChineseAnimalIntent';
    },
    async handle(handlerInput) {
        // invoke custom logic of the handler
        const year = Number(Alexa.getSlotValue(handlerInput.requestEnvelope, 'year'));
        let speechText = "none";
        try {
            let data = await ddb.get({
                TableName: "ChineseZodiacAnimal",
                Key: {
                    BirthYear: year
                }
            }).promise();

            speechText = "your animal is a" + data.Item.Animal;

        } catch (error) {
            speechText = "I don\'t know"
        };

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle(handlerInput) {
        return true;
    },
    handle(handlerInput, error) {
        console.log('Error handled: ' + JSON.stringify(error.message));
        // console.log('Original Request was:', JSON.stringify(handlerInput.requestEnvelope.request, null, 2));

        const speechText = 'Sorry, your skill encountered an error';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};
exports.handler = async function (event, context) {
    //console.log('REQUEST ' + JSON.stringify(event));
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
            .addErrorHandlers(ErrorHandler)
            .addRequestHandlers(
                // delete undefined built-in intent handlers
                CancelIntentHandler,
                HelpIntentHandler,
                StopIntentHandler,
                NavigateHomeIntentHandler,
                FallbackIntentHandler,
                LaunchRequestHandler,
                SessionEndedRequestHandler
                // add custom Intent handlers
            ).create();
    }

    const response = await skill.invoke(event, context);
    //console.log('RESPONSE :' + JSON.stringify(response));
    return response;
};

//--------------------------------------------------------------------------

