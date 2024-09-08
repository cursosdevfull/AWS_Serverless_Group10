const handler = async (event) => {
  console.log(event);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from the appointment PE handler",
    }),
  };
};

export const appointment = handler;
