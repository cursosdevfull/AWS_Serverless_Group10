const handler = async (event) => {
  if (event.Records && event.Records.length > 0) {
    for (const record of event.Records) {
      console.log("Record: ", record);
    }
  }
};

export const dlqHandle = handler;
