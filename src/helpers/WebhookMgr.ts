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
    console.log(`===== Received CircleCI ${identifier} =====`);
    let fields: ICircleCIFields = {};
    //Accepts only brances that follow Aha! naming convention
    let reference = this.extractReference(payload.pipeline.vcs.branch);
    let record;
    //Get record name with branch / commit subject / commit description
    if (reference) {
      try {
        record = await getRecord(reference.type, reference.referenceNum, false);
      } catch (error) {
        console.log("first error: ");
        reference = this.extractReference(payload.pipeline.vcs.commit.subject || "");
        if (reference) {
          try {
            record = await getRecord(reference.type, reference.referenceNum, false);
          } catch (error) {
            reference = this.extractReference(payload.pipeline.vcs.commit.body || "");
            if (reference) {
              try {
                record = await getRecord(reference.type, reference.referenceNum, false);
              } catch (error) {
                console.log(`========= ${error.message}`);
                return;
              }
            }
          }
        } else {
          reference = this.extractReference(payload.pipeline.vcs.commit.body || "");
          if (reference) {
            try {
              record = await getRecord(reference.type, reference.referenceNum, false);
            } catch (error) {
              console.log(`========= ${error.message}`);
              return;
            }
          }
        }
      }
    } else {
      reference = this.extractReference(payload.pipeline.vcs.commit.subject || "");
      if (reference) {
        try {
          record = await getRecord(reference.type, reference.referenceNum, false);
        } catch (error) {
          reference = this.extractReference(payload.pipeline.vcs.commit.body || "");
          if (reference) {
            try {
              record = await getRecord(reference.type, reference.referenceNum, false);
            } catch (error) {
              console.log(`========= ${error.message}`);
              return;
            }
          }
        }
      } else {
        reference = this.extractReference(payload.pipeline.vcs.commit.body || "");
        if (reference) {
          try {
            record = await getRecord(reference.type, reference.referenceNum, false);
          } catch (error) {
            console.log(`========= ${error.message}`);
            return;
          }
        }
      }
    }

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

  /**
   * 
   * @param {string} referenceVal
   * @returns {object | null} :Record or null
   */
  static extractRecord = (referenceVal: string) => {

  }

  /**
   * Extract reference from branch name 
   * @param {string} name
  */
  static extractReference = (name: string): { type: IAhaReferenceType, referenceNum: string } => {
    let matches;

    // Requirement
    if ((matches = name.match(/[a-z]{1,10}-[0-9]+-[0-9]+/i))) {
      return {
        type: "Requirement",
        referenceNum: matches[0],
      };
    }
    // Epic
    if ((matches = name.match(/[a-z]{1,10}-E-[0-9]+/i))) {
      return {
        type: "Epic",
        referenceNum: matches[0],
      };
    }
    // Feature
    if ((matches = name.match(/[a-z]{1,10}-[0-9]+/i))) {
      return {
        type: "Feature",
        referenceNum: matches[0],
      };
    }

    return null;
  }

  constructor(private resource: ICircleCIEventType, private payload: any, private identifier = IDENTIFIER) { }

}
