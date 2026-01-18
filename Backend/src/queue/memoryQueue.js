const queue = [];

// producer
export function pushEvent(event) {
  queue.push(event);
}

// consumer
export async function popEvent(params) {
  while (queue.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return queue.shift();
  //   shift() removes the first element
}
