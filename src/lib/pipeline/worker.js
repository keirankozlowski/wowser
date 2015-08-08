const worker = self;

const loaders = {
  ADT: require('./adt/loader'),
  M2: require('./m2/loader')
};

worker.addEventListener('message', (event) => {
  const [loader, ...args] = event.data;
  if(loader in loaders) {
    loaders[loader](...args).then(function(result) {
      worker.postMessage(result);
      worker.close();
    });
  } else {
    worker.close();
  }
});
