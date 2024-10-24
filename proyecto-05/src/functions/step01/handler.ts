const handler = async (event) => {
  console.log("Event:", event);
  return event.countryISO;
};

export const step01 = handler;
