import React from "react";
import AttributeCard from "./AttributeCard";

export type AttributeProps = {
  record: Aha.RecordUnion;
  fields: ICircleCIFields;
};

const Attribute = ({ fields, record }: AttributeProps) => {
  return (
    <aha-flex align-items="left" direction="column" gap="5px">
      {fields.project && (
        <aha-flex>
          <span className="type-icon">
            <aha-icon icon="fa-solid fa-bookmark type-icon" />
            <span style={{ marginLeft: "5px", fontWeight: "bold" }}>
              {fields.project}
            </span>
          </span>
        </aha-flex>
      )}
      {fields.branches && <AttributeCard branches={fields.branches} />}
      <aha-flex direction="row" justify-content="flex-end">
        <aha-button
          kind="secondary"
          href={fields.permalink}
          size="mini"
          target="_blank"
        >
          View in CircleCI
        </aha-button>
      </aha-flex>
    </aha-flex>
  );
};

export default Attribute;
