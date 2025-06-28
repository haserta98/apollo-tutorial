import LoggingBootstrapper from "./bootstrap";

new LoggingBootstrapper().initialize()
  .then(() => {
    console.log("Logging service initialized successfully.");
  })

