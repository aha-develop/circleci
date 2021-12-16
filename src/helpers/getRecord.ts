
/**
   * Get record from branch name | commit subject | commit body
   * @param {string[]} arrNames
  */
export const getRecord = async (arrNames: string[]): Promise<Aha.RecordUnion> => {
  let reference = extractReference(arrNames.pop());
  if (reference) {
    const RecordClass = aha.models[reference.type];
    if (!RecordClass) {
      console.log(`Invalid Record Type ${reference.type}`);
      return null;
    }
    try {
      // @ts-ignore
      const record: Aha.RecordUnion = await RecordClass.select("id", "referenceNum").find(reference.referenceNum);
      return record;
    } catch (error) { //This is the case that branch has correct naming convention but aha! doesn't have that record
      getRecord(arrNames);
    }
  } else if (arrNames.length > 0) {
    getRecord(arrNames);
  } else return null;
}

/**
   * Extract reference from given string
   * @param {string} name
  */
export const extractReference = (name: string): { type: IAhaReferenceType, referenceNum: string } => {
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
