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
      const builds = await record.getExtensionField(identifier, "builds");
      const permalink = await record.getExtensionField(identifier, "permalink");
      fields.permalink = `${CIRCLECI_URL}/${payload.project.slug}`;
      fields.project = project || payload.project.name;
      const buildInfo = {
        branch: payload.pipeline.vcs.branch,
        type: payload.type,
        status: payload.workflow.status,
        happened_at: payload.happened_at,
        workflow: payload.workflow.name,
        commit: payload.pipeline.vcs.commit.subject,
        author: { name: payload.pipeline.vcs.commit.author.name },
        buildNum: payload.pipeline.number,
        permalink: payload.workflow.url
      }
      //Update only if build type is "work-completed", excluding "job-completed"
      if (payload.type !== "workflow-completed") {
        return;
      }
      //If branch is array object
      if (_.isArray(builds)) {
        const buildIndex = _.findIndex(builds, (item) => {
          return item.branch === buildInfo.branch;
        })
        //If branch exists
        if (buildIndex >= 0) {
          fields.builds = [...builds]
          fields.builds[buildIndex] = {
            ...builds[buildIndex],
            happened_at: buildInfo.happened_at,
            commit: buildInfo.commit,
            author: { name: payload.pipeline.vcs.commit.author.name },
            buildNum: payload.pipeline.number,
            status: payload.workflow.status,
            workflow: payload.workflow.name
          }
        } else {
          fields.builds = [...builds ?? []];
          fields.builds.push(buildInfo);
        }
      } else {
        fields.builds = [buildInfo];
      }
      await setExtensionFields(record, fields, identifier);
    } else {
      console.log("======== Record not found")
    }

  };

  constructor(private resource: ICircleCIEventType, private payload: any, private identifier = IDENTIFIER) { }

}
