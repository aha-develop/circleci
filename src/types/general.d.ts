declare interface IToken {
  access_token?: string;
  refresh_token?: string;
}

declare interface AvatarType {
  avatarType: "letter_avatar" | "upload";
  avatarUuid?: string | null;
}

declare type IAhaReferenceType = "Epic" | "Feature" | "Requirement";

declare interface IAhaReference { type: IAhaReferenceType; referenceNum: string }

declare type ICircleCIEventType = "workflow-completed" | "job-completed";

declare type ICircleCIEventStatus = "success" | "failed";

declare interface ICircleCIEventUser {
  name: string;
  image?: string;
}

declare interface IBranchType {
  type: ICircleCIEventType; // Type of build: workflow or job
  status: ICircleCIEventStatus; // Workflow result status(success | fail)
  branch: string; // Branch name
  happened_at: Date;
  workflow: string; // Workflow name
  commit: string; // Commit subject
  author: ICircleCIEventUser; // Commit Author
  buildNum: number; // Pipeline number
}
declare interface ICircleCIFields {
  project?: string;
  branches?: IBranchType[];
  permalink?: string; // Redirect link to CircleCI
}