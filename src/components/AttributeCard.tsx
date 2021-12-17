import React, { useEffect } from "react";
import { calcTimeElapsed } from "@helpers/dateTime";

export type AttributeCardProps = {
  branches?: IBranchType[];
};

export const IconText = (props: {
  icon: string;
  text?: string;
  style?: any;
  iconStyle?: any;
}) => (
  <span style={props.style ? { ...props.style } : {}}>
    <aha-icon
      icon={`${props.icon} type-icon`}
      style={props.iconStyle ? { ...props.iconStyle } : {}}
    />
    <span style={{ marginLeft: "5px" }}>{props.text}</span>
  </span>
);

const StatusIcon = ({
  status,
  style = {},
}: {
  status: boolean;
  style?: any;
}) => {
  const statusIconStyle = {
    fontSize: "12px",
    lineHeight: "14px",
    padding: "4px 8px",
    borderRadius: "4px",
    verticalAlign: 'middle',
    ...style
  }
  return (
    <>
      {status && (
        <IconText
          icon="fa-solid fa-check-circle"
          text="Success"
          style={{
            ...statusIconStyle,
            color: "var(--theme-green-text)",
            backgroundColor: "var(--theme-green-background)",
          }}
        />
      )}
      {!status && (
        <IconText
          icon="fa-regular fa-times-circle"
          text="Failed"
          style={{
            ...statusIconStyle,
            color: "var(--theme-red-text)",
            backgroundColor: "var(--theme-red-background)",
          }}
        />
      )}
    </>
  );
};

const HoverCard = (props: {
  buildNum: number;
  workflow: string;
  commit: string;
  author: string;
  style?: any;
}) => {
  props.style = props.style || {};
  return (
    <aha-flex direction="column">
      <span><strong>Build #:</strong> {props.buildNum}</span>
      <span><strong>Workflow:</strong> {props.workflow}</span>
      <span><strong>Commit:</strong> {props.commit}</span>
      <span><strong>Author:</strong> {props.author}</span>
    </aha-flex>
  );
};

const AttributeCard = (props: AttributeCardProps) => {
  const branches = props.branches.sort(
    (a, b) =>
      new Date(b.happened_at).getTime() - new Date(a.happened_at).getTime()
  ); // Sort(Descending) by happened_at
  return (
    <div
      style={{
        flexGrow: 1,
        padding: "8px 0",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      {branches.map((branch, index) => (
        <aha-tooltip type="popover" hover-show hover-hide style={{ width: '100%' }}>
          <div slot="trigger" style={{ width: '100%' }}>
            <aha-flex justify-content="space-between" align-items="center" gap="8px" onClick={(e) => window.open(branch.permalink, '_blank')} style={{ padding: '8px 0', borderTop: index === 0 ? '' : '1px solid var(--theme-light-border)'}}>
              <IconText
                icon="fa-regular fa-code-branch"
                text={branch.branch}
                style={{ flexGrow: 1 }}
                iconStyle={{ color: "#1082d5" }}
              />
              <StatusIcon
                status={branch.status === "success" ? true : false}
              />
              <IconText
                icon="fa-regular fa-clock type-icon"
                text={calcTimeElapsed(branch.happened_at)}
                iconStyle={{ color: "#1082d5" }}
              />
            </aha-flex>
          </div>
          <HoverCard
            buildNum={branch.buildNum}
            author={branch.author.name || "Unknown"}
            commit={branch.commit || "Unknown"}
            workflow={branch.workflow}
            style={{ top: `${-5 + 40 * (index - 1)}px` }}
          />
        </aha-tooltip>
      ))}
    </div>
  );
};

export default AttributeCard;
