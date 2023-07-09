import { Container } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";
import { Configuration } from "../ValueObjects/Configuration.js";
import { LemmyApiMock } from "../../Tests/Mocks/LemmyApiMock.js";

const testcontainer = new Container();
const configuration = Configuration.createFromEnv();
testcontainer.bind<Configuration>(Configuration).toConstantValue(configuration);

// Bind the factory function to create LemmyApiMock instances
testcontainer.bind<LemmyApiMock>(LemmyApiMock);

testcontainer.load(buildProviderModule());

export { testcontainer };
