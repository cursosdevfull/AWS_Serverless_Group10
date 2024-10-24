import {
  InvocationType,
  InvokeCommand,
  InvokeCommandInput,
  InvokeCommandOutput,
  LambdaClient,
} from "@aws-sdk/client-lambda";

export class LambdaConstructor {
  private readonly client = new LambdaClient();

  private generateCommand(
    lambdaName: string,
    invocationType: InvocationType,
    payload: any
  ) {
    const input: InvokeCommandInput = {
      FunctionName: lambdaName,
      InvocationType: invocationType,
      Payload: JSON.stringify(payload),
    };

    return new InvokeCommand(input);
  }

  async invokeLambda<T>(
    lambdaName: string,
    payload: T,
    invocationType: InvocationType
  ): Promise<InvokeCommandOutput> {
    const command = this.generateCommand(lambdaName, invocationType, payload);
    return this.client.send(command);
  }
}
