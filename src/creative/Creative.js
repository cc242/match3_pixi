/*global*/
import Visualisation from './Visualisation';
import Layout from '../core/Layout';

var creative = {
    defaults: {
        container: '.container'
    },
    options: {},
    config: {container: '', width: 320, height: 568},
    init: function(opts) {

        for(var i in opts){
            this.options[i] = {
                value: opts[i],
                enumerable: true,
                writeable: true,
                configurable: true
            }
        }
        this.config = Object.create(this.defaults, this.options);
        let layout = new Layout();
        layout.init(this.config);
        let visualisation = new Visualisation();
        visualisation.init(this.config);
    }
};


export default creative;