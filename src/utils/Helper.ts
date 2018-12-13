export class Helper {
    static parseStyle = (style = ""): { [key: string]: string } => { // Doesn't support a few stuff.
        try {
            return style.split(";").reduce<{ [key: string]: string }>((styleObject, line) => {
                const pair = line.split(":");
                if (pair.length === 2) {
                    const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                    styleObject[name] = pair[1].trim();
                }

                return styleObject;
            }, {});
        } catch (error) {
            // tslint:disable-next-line no-console
            window.logger.error("Failed to parse style", style, error);
        }

        return {};
    }
}
