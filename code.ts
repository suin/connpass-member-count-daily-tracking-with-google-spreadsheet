const config = {
  group: "yyts",
  sheetName: "Data",
};

function trackConnpassMemberCount() {
  new Sheet(config.sheetName).append({
    group: config.group,
    date: new Date(),
    memberCount: retry(() => connpass.getMemberCount(config.group)),
  });
}

namespace connpass {
  export function getMemberCount(group: string): number {
    const res = UrlFetchApp.fetch(`https://${group}.connpass.com`, {
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() === 200) {
      return parseMemberCount(res.getContentText());
    } else {
      throw new Error(`HTTP error ${res.getResponseCode()}`);
    }
  }

  function parseMemberCount(html: string): number {
    const matches = html.match(
      /<span class="amount">(?<memberCount>\d+)<\/span>人/
    );
    if (typeof matches?.groups?.["memberCount"] !== "string") {
      throw Object.assign(new Error("Failed to parse HTML"), { html });
    }
    const memberCount = parseInt(matches?.groups?.["memberCount"], 10);
    if (Number.isNaN(memberCount)) {
      throw Object.assign(new Error("Failed to parse member count"), {
        memberCount,
      });
    }
    return memberCount;
  }
}

class Sheet {
  private readonly sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(readonly sheetName: string) {
    const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`No sheet found: ${sheetName}`);
    }
    this.sheet = sheet;
  }

  append({
    group,
    date,
    memberCount,
  }: {
    readonly group: string;
    readonly date: Date;
    readonly memberCount: number;
  }): void {
    const rowValues = [
      group,
      Utilities.formatDate(date, "Asia/Tokyo", "yyyy-MM-dd HH:mm:ss"),
      memberCount,
    ];
    const lastRow = this.sheet.getLastRow();
    const range = this.sheet.getRange(lastRow + 1, 1, 1, rowValues.length);
    range.setValues([rowValues]);
  }
}

function retry<T>(func: () => T, left = 10): T {
  try {
    return func();
  } catch (e: any) {
    console.log(`Failed to run ${e.message}. retrying...`);
    if (left === 0) {
      console.log("Give-up");
      throw e;
    }
    Utilities.sleep(5000);
    return retry(func, left - 1);
  }
}
