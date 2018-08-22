import './index.css';
import _Creative from './creative/Creative';

var Creative = window.Creative || {};
Creative.main = _Creative;
window.Creative = Creative.main;