interface ReferenceDescriptor {
  type: IAhaReferenceType;
  referenceNum: string;
}

/**
 * Find Aha! records mentioned in the supplied array of search strings.
 * @param {string[]} searchStrings
 */
export const getRecords = async (
  searchStrings: string[]
): Promise<Aha.RecordUnion[]> => {
  // Collect unique references
  const references = searchStrings.reduce((acc, s) => {
    const reference = extractReference(s);

    if (!reference) {
      return acc;
    }

    if (!acc.some((x) => x.referenceNumber === reference.referenceNum)) {
      acc.push(reference);
    }

    return acc;
  }, []);

  console.log(`Found ${references.length} references`);

  const records = references.map((reference) => {
    if (!reference) return null;

    return resolveReference(reference);
  });

  return Promise.all(records).then((v) => v.filter(Boolean));
};

/**
 * Queries the Aha! API to fetch the record described by `descriptor`.
 *
 * @param descriptor
 * @returns A promise yielding the matching record, if any
 */
const resolveReference = async (
  descriptor: ReferenceDescriptor
): Promise<Aha.RecordUnion | null> => {
  console.log(`Extracted ${descriptor.referenceNum} from payload`);

  const RecordClass = aha.models[descriptor.type];
  if (!RecordClass) {
    console.log(`Invalid Record Type ${descriptor.type}`);
    return null;
  }

  try {
    // @ts-ignore
    const record: Aha.RecordUnion = await RecordClass.select(
      "id",
      "referenceNum"
    ).find(reference.referenceNum);
    console.log(`Found record for ${descriptor.referenceNum}`);

    return record;
  } catch (error) {
    //This is the case that branch has correct naming convention but aha! doesn't have that record
    console.log(`Unable to find record for ${descriptor.referenceNum}`);
    console.error(error);

    return null;
  }
};

/**
 * Extract Aha! record reference from given string
 * @param {string} name
 */
const extractReference = (name: string): ReferenceDescriptor | null => {
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
};
