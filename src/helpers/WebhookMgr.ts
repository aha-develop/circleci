import _ from "lodash";
import { IDENTIFIER, CIRCLECI_URL } from "./config";
import { getRecord } from "./getRecord";
import { setExtensionFields } from "./setExtensionFields";

export class WebhookMgr {
  /**
   * Handles Webhook
   *
   * @param headers
   * @param payload
   */
  static webhookHandler = async ({ headers, payload }, { identifier, settings }) => {
    let fields: ICircleCIFields = {};
    const arrNames = [payload.pipeline.vcs.commit.body || "", payload.pipeline.vcs.commit.subject || "", payload.pipeline.vcs.branch];
    //Accepts only brances that follow Aha! naming convention
    const record = await getRecord(arrNames);
    if (record) {
      const project = await record.getExtensionField(identifier, "project");
      const branches = await record.getExtensionField(identifier, "branches");
      const permalink = await record.getExtensionField(identifier, "permalink");
      fields.permalink = `${CIRCLECI_URL}/${payload.project.slug}`;
      fields.project = project || payload.project.name;
      const branchInfo = {
        branch: payload.pipeline.vcs.branch,
        type: payload.type,
        status: payload.workflow.status,
        happened_at: payload.happened_at,
        workflow: payload.workflow.name,
        commit: payload.pipeline.vcs.commit.subject,
        author: { name: payload.pipeline.vcs.commit.author.name },
        buildNum: payload.pipeline.number
      }
      //Update only if build type is "work-completed", excluding "job-completed"
      if (payload.type !== "workflow-completed") {
        return;
      }
      //If branch is array object
      if (_.isArray(branches)) {
        const branchIndex = _.findIndex(branches, (item) => {
          return item.branch === branchInfo.branch;
        })
        //If branch exists
        if (branchIndex >= 0) {
          fields.branches = [...branches]
          fields.branches[branchIndex] = {
            ...branches[branchIndex],
            happened_at: branchInfo.happened_at,
            commit: branchInfo.commit,
            author: { name: payload.pipeline.vcs.commit.author.name },
            buildNum: payload.pipeline.number,
            status: payload.workflow.status,
            workflow: payload.workflow.name
          }
        } else {
          fields.branches = [...branches ?? []];
          fields.branches.push(branchInfo);
        }
      } else {
        fields.branches = [branchInfo];
      }
      await setExtensionFields(record, fields, identifier);
    } else {
      console.log("======== Record not found")
    }

  };

  constructor(private resource: ICircleCIEventType, private payload: any, private identifier = IDENTIFIER) { }

}
