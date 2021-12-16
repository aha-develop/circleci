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
  return (
    <>
      {status && (
        <IconText
          icon="fa-solid fa-check-circle"
          text="Success"
          style={{
            ...style,
            color: "#3eb268",
            backgroundColor: "#caf3d1",
            fontSize: "12px",
            padding: "2px 5px",
            borderRadius: "3px",
          }}
        />
      )}
      {!status && (
        <IconText
          icon="fa-solid fa-check-circle"
          text="Failed"
          style={{
            ...style,
            color: "red",
            backgroundColor: "#ffc0c0",
            fontSize: "12px",
            padding: "2px 5px",
            borderRadius: "3px",
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
    <div
      style={{
        position: "absolute",
        background: "white",
        top: "-55px",
        boxShadow: "0px 0px 5px 1px #a5a5a5",
        padding: "10px",
        fontSize: "12px",
        ...props.style,
      }}
    >
      <aha-flex direction="column">
        <span>Build #: {props.buildNum}</span>
        <span>Workflow: {props.workflow}</span>
        <span>Commit: {props.commit}</span>
        <span>Author: {props.author}</span>
      </aha-flex>
    </div>
  );
};

const AttributeCard = (props: AttributeCardProps) => {
  const branches = props.branches.sort(
    (a, b) =>
      new Date(b.happened_at).getTime() - new Date(a.happened_at).getTime()
  ); // Sort(Descending) by happened_at
  const initHovers = branches.map((_) => false);
  const [hovers, setHovers] = React.useState<boolean[]>(initHovers);
  return (
    <div
      style={{
        // backgroundColor: "lightblue",
        flexGrow: 1,
        padding: "8px 0",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      {branches.map((branch, index) => (
        <div
          style={{
            // backgroundColor: "var(--theme-tertiary-background)",

            display: "flex",
            padding: "5px ",
            margin: "10px 0",
            ...(hovers[index] ? { backgroundColor: "lightblue" } : {}),
          }}
          onMouseOver={() => {
            let tmpHovers = [...initHovers];
            tmpHovers[index] = true;
            setHovers(tmpHovers);
          }}
          onMouseOut={() => {
            let tmpHovers = [...initHovers];
            tmpHovers[index] = false;
            setHovers(tmpHovers);
          }}
        >
          <IconText
            icon="fa-regular fa-code-branch"
            text={branch.branch}
            style={{ fontSize: "12px", flexGrow: 1 }}
            iconStyle={{ color: "#1082d5" }}
          />
          <StatusIcon
            status={branch.status === "success" ? true : false}
            style={{ marginRight: "45px", width: "70px", maxHeight: "16px" }}
          />
          <IconText
            icon="fa-regular fa-clock type-icon"
            text={calcTimeElapsed(branch.happened_at)}
            style={{ fontSize: "12px", width: "125px" }}
            iconStyle={{ color: "#1082d5" }}
          />
          {hovers[index] && (
            <HoverCard
              buildNum={branch.buildNum}
              author={branch.author.name || "Unknown"}
              commit={branch.commit || "Unknown"}
              workflow={branch.workflow}
              style={{ top: `${-5 + 40 * (index - 1)}px` }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default AttributeCard;
