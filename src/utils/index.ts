


export function createPageUrl(pageName: string) {
    // Convert PascalCase/camelCase and spaces to kebab-case
    return (
        '/' + pageName
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .replace(/\s+/g, '-')
            .toLowerCase()
    );
}
