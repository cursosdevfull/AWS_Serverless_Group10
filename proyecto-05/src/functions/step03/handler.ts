const handler = async (event) => {
  console.log("Event:", event);
  return event.countryISO;
};

export const step03 = handler;
