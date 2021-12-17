import React from "react";
import AttributeCard from "./AttributeCard";

export type AttributeProps = {
  record: Aha.RecordUnion;
  fields: ICircleCIFields;
};

const EmptyState = ({ record }) => (
  <aha-flex
    direction="row"
    gap="8px"
    justify-content="start"
    style={{ padding: '2px 5px', color: 'var(--theme-tertiary-text)' }}>
    <aha-icon icon="fa-regular fa-code-branch type-icon" />
    <span>
      Include <strong>{record.referenceNum}</strong> in your branch name or commit message
    </span>
  </aha-flex>
)

const Attribute = ({ fields, record }: AttributeProps) => {
  const hasBuilds = fields.builds && fields.builds.length > 0

  return (
    <aha-flex align-items="left" direction="column" gap="5px" style={{ padding: '0 5px' }}>
      {hasBuilds ?
        <>
          {fields.project && (
            <aha-flex>
              <span className="type-icon">
                <aha-icon icon="fa-solid fa-bookmark type-icon" />
                <span style={{ marginLeft: "5px", fontWeight: "bold" }}>{fields.project}</span>
              </span>
            </aha-flex>
          )}
          {fields.builds && <AttributeCard branches={fields.builds} />}
        </> :
        <EmptyState record={record} />
      }
    </aha-flex>
  );
};

export default Attribute;
