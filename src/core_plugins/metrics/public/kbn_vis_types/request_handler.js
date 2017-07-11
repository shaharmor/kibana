import { validateInterval } from '../lib/validate_interval';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';

const MetricsRequestHandlerProvider = function (Private, Notifier, config, timefilter, $http) {
  const dashboardContext = Private(dashboardContextProvider);
  const notify = new Notifier({ location: 'Metrics' });

  return {
    name: 'metrics',
    handler: function (vis , appState, uiState) {
      return new Promise((resolve) => {
        const panel = vis.params;
        const uiStateObj = uiState.get(panel.type, {});
        if (panel && panel.id) {
          const params = {
            timerange: timefilter.getBounds(),
            filters: [dashboardContext()],
            panels: [panel],
            state: uiStateObj
          };

          try {
            const maxBuckets = config.get('metrics:max_buckets');
            validateInterval(timefilter, panel, maxBuckets);
            return $http.post('../api/metrics/vis/data', params)
              .success(resolve)
              .error(resp => {
                resolve({});
                const err = new Error(resp.message);
                err.stack = resp.stack;
                notify.error(err);
              });
          } catch (e) {
            notify.error(e);
            return resolve();
          }
        }
      });
    }
  };
};

export { MetricsRequestHandlerProvider };
