import { isArray, findIndex } from "lodash";
import { IDENTIFIER, CIRCLECI_URL } from "./config";
import { getRecords } from "./getRecord";
import { setExtensionFields } from "./setExtensionFields";

export class WebhookMgr {
  /**
   * Handles Webhook
   *
   * @param headers
   * @param payload
   */
  static webhookHandler = async (
    { headers, payload },
    { identifier, settings }
  ) => {
    //Accepts only brances that follow Aha! naming convention
    const arrNames = [
      payload.pipeline.vcs.commit.body || "",
      payload.pipeline.vcs.commit.subject || "",
      payload.pipeline.vcs.branch,
    ];
    const records = await getRecords(arrNames);

    records.forEach(async (record) => {
      const fields: ICircleCIFields = {
        permalink: `${CIRCLECI_URL}/${payload.project.slug}`,
        project: payload.project.name,
      };

      const builds = await record.getExtensionField(identifier, "builds");
      const buildInfo: IBuildType = {
        branch: payload.pipeline.vcs.branch,
        type: payload.type,
        status: payload.workflow.status,
        happened_at: payload.happened_at,
        workflow: payload.workflow.name,
        commit: payload.pipeline.vcs.commit.subject,
        author: { name: payload.pipeline.vcs.commit.author.name },
        buildNum: payload.pipeline.number,
        permalink: payload.workflow.url,
      };

      // Update only if build type is "workflow-completed", excluding "job-completed"
      if (payload.type !== "workflow-completed") {
        return;
      }

      //If builds is array object
      if (isArray(builds)) {
        const buildIndex = findIndex(builds, (item) => {
          return item.branch === buildInfo.branch;
        });

        //If build exists
        if (buildIndex >= 0) {
          fields.builds = [...builds];
          fields.builds[buildIndex] = {
            ...builds[buildIndex],
            ...buildInfo,
          };
        } else {
          fields.builds = [...(builds ?? [])];
          fields.builds.push(buildInfo);
        }
      } else {
        fields.builds = [buildInfo];
      }

      await setExtensionFields(record, fields, identifier);

      if (buildInfo.status === "success") {
        await aha.triggerAutomationOn(record, `${identifier}.buildPassed`, true);
      } else {
        await aha.triggerAutomationOn(record, `${identifier}.buildFailed`, true);
      }
    });
  };

  constructor(
    private resource: ICircleCIEventType,
    private payload: any,
    private identifier = IDENTIFIER
  ) {}
}
