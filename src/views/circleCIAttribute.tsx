import React from "react";
import Attribute from "@components/Attribute";

aha.on("circleCIAttribute", ({ record, fields, onUnmounted }, { identifier, settings }) => {
  return <Attribute fields={fields} record={record} />;
});
