module.exports.task = async (event) => {
  console.log("event", event);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Function has been executed",
    }),
  };
};
