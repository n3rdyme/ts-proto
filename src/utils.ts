import ReadStream = NodeJS.ReadStream;
import { Options } from './main';
import { SourceDescription } from './sourceInfo';

export function readToBuffer(stream: ReadStream): Promise<Buffer> {
  return new Promise(resolve => {
    const ret: Array<Buffer | string> = [];
    let len = 0;
    stream.on('readable', () => {
      let chunk;
      while ((chunk = stream.read())) {
        ret.push(chunk);
        len += chunk.length;
      }
    });
    stream.on('end', () => {
      resolve(Buffer.concat(ret as any, len));
    });
  });
}

export function fail(message: string): never {
  throw new Error(message);
}

export function singular(name: string): string {
  return name.substring(0, name.length - 1); // drop the 's', which is extremely naive
}

export function lowerFirst(name: string): string {
  return name.substring(0, 1).toLowerCase() + name.substring(1);
}

export function upperFirst(name: string): string {
  return name.substring(0, 1).toUpperCase() + name.substring(1);
}

export function optionsFromParameter(parameter: string): Options {
  const options: Options = { useContext: false, snakeToCamel: true, forceLong: false };
  if (parameter) {
    if (parameter.includes('context=true')) {
      options.useContext = true;
    }
    if (parameter.includes('snakeToCamel=false')) {
      options.snakeToCamel = false;
    }
    if (parameter.includes('forceLong=true')) {
      options.forceLong = true;
    }
  }
  return options;
}

// addJavadoc will attempt to expand unescaped percent %, so we replace these within source comments.
const PercentAll = /\%/g;
// Since we don't know what form the comment originally took, it may contain closing block comments.
const CloseComment = /\*\//g;

/**
 * Removes potentially harmful characters from comments and calls the provided expression
 * @param desc {SourceDescription} original comment information
 * @param process {(comment: string) => void} called if a comment exists
 * @returns {string} scrubbed text
 */
export function withComment(desc: SourceDescription, process: (comment: string) => void) {
  if (process && (desc.leadingComments || desc.trailingComments)) {
    return process(
      (desc.leadingComments || desc.trailingComments || '')
    .replace(PercentAll, '%%')
    .replace(CloseComment, '* /')
    );
  }
  
}