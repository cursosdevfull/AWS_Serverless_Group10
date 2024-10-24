import {
  SFNClient,
  StartExecutionCommand,
  StartExecutionCommandInput,
} from "@aws-sdk/client-sfn";
import { v4 as uuidv4 } from "uuid";

export const sfnClient = new SFNClient({});

export class SFNConstructor {
  private readonly client = sfnClient;

  async startStateMachine(
    arnStateMachine: string,
    countryISO: string
  ): Promise<any> {
    const name = uuidv4();
    const input: StartExecutionCommandInput = {
      stateMachineArn: arnStateMachine,
      input: JSON.stringify({ countryISO }),
      name,
    };

    const command = new StartExecutionCommand(input);
    return this.client.send(command);
  }
}
