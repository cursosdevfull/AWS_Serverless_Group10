const mainFunction = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello, the input was ${event.body}`,
    }),
  };
};

export const main = mainFunction;
