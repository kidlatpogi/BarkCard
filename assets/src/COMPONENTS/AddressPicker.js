import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import styles from '../STYLES/CompleteProfile.styles';

const BASE = 'https://isaacdarcilla.github.io/philippine-addresses';

// Metro doesn't support dynamic/template requires. Create a static mapping of local JSONs
// and try those first. If a file isn't available, fall back to network fetch.
let localProvince = null;
let localCity = null;
let localBarangay = null;
let localRegion = null;
try {
  // eslint-disable-next-line global-require
  localProvince = require('../../vendor/select-philippines-address/data/province.json');
} catch (e) {
  localProvince = null;
}
try {
  // eslint-disable-next-line global-require
  localCity = require('../../vendor/select-philippines-address/data/city.json');
} catch (e) {
  localCity = null;
}
try {
  // eslint-disable-next-line global-require
  localBarangay = require('../../vendor/select-philippines-address/data/barangay.json');
} catch (e) {
  localBarangay = null;
}
try {
  // eslint-disable-next-line global-require
  localRegion = require('../../vendor/select-philippines-address/data/region.json');
} catch (e) {
  localRegion = null;
}

const tryLoadLocal = (name) => {
  switch (name) {
    case 'province': return localProvince;
    case 'city': return localCity;
    case 'barangay': return localBarangay;
    case 'region': return localRegion;
    default: return null;
  }
};

const fetchJson = async (name) => {
  const local = tryLoadLocal(name);
  if (local) return local;
  const res = await fetch(`${BASE}/${name}.json`);
  if (!res.ok) throw new Error('Network error');
  return res.json();
};

export default function AddressPicker({ visible, onClose, onSelect }) {
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [regions, setRegions] = useState([]);

  const [step, setStep] = useState(1); // 1: region, 2: province, 3: city, 4: barangay
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [reg, prov, city, brgy] = await Promise.all([
          fetchJson('region'),
          fetchJson('province'),
          fetchJson('city'),
          fetchJson('barangay')
        ]);
        if (!mounted) return;
        setRegions(reg.data || reg);
        setProvinces(prov.data || prov);
        setCities(city.data || city);
        setBarangays(brgy.data || brgy);
      } catch (e) {
        console.warn('Failed to load address data', e?.message || e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (visible) load();
    return () => { mounted = false; };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setStep(1); setSelectedRegion(null); setSelectedProvince(null); setSelectedCity(null); setSelectedBarangay(null); setQuery('');
    }
  }, [visible]);

  const filtered = (list, key) => {
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(item => (item[key] || '').toLowerCase().includes(q));
  };

  // The FlatList renders mapped items (code,name). Find the original object by code
  const onRegionPress = (r) => {
    const regionObj = regions.find(x => x.region_code === r.code) || regions.find(x => x.region_name === r.name);
    setSelectedRegion(regionObj || r);
    setSelectedProvince(null); setSelectedCity(null); setSelectedBarangay(null); setStep(2); setQuery('');
  };
  const onProvincePress = (p) => {
    const provObj = provinces.find(x => x.province_code === p.code) || provinces.find(x => x.province_name === p.name);
    setSelectedProvince(provObj || p);
    setSelectedCity(null); setSelectedBarangay(null); setStep(3); setQuery('');
  };
  const onCityPress = (c) => {
    const cityObj = cities.find(x => x.city_code === c.code) || cities.find(x => x.city_name === c.name);
    setSelectedCity(cityObj || c);
    setSelectedBarangay(null); setStep(4); setQuery('');
  };
  const onBarangayPress = (b) => {
    const brgyObj = barangays.find(x => (x.brgy_code === b.code) || (x.brgy_name === b.name));
    const finalBrgy = brgyObj || b;
    setSelectedBarangay(finalBrgy);
    if (onSelect) onSelect({ region: selectedRegion, province: selectedProvince, city: selectedCity, barangay: finalBrgy });
    if (onClose) onClose();
  };

  const provincesList = selectedRegion ? provinces.filter(p => p.region_code === selectedRegion.region_code).map(p => ({ code: p.province_code, name: p.province_name, psgc: p.psgc_code })) : [];
  const citiesList = selectedProvince ? cities.filter(c => c.province_code === selectedProvince.province_code).map(c => ({ code: c.city_code, name: c.city_name })) : [];
  const barangaysList = selectedCity ? barangays.filter(b => b.city_code === selectedCity.city_code).map(b => ({ code: b.brgy_code, name: b.brgy_name })) : [];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
        <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#e6e9ef', backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>{step === 1 ? 'Select Region' : step === 2 ? 'Select Province' : step === 3 ? 'Select City/Municipality' : 'Select Barangay'}</Text>
          <TextInput placeholder="Search..." value={query} onChangeText={setQuery} style={{ marginTop: 8, height: 40, borderRadius: 8, backgroundColor: '#fff', paddingHorizontal: 10, borderWidth: 1, borderColor: '#e6e9ef' }} />
        </View>

        {loading ? <ActivityIndicator style={{ marginTop: 24 }} /> : (
          <FlatList
            data={ step === 1 ? filtered(regions.map(r => ({ code: r.region_code, name: r.region_name })), 'name') : step === 2 ? filtered(provincesList, 'name') : step === 3 ? filtered(citiesList, 'name') : filtered(barangaysList, 'name') }
            keyExtractor={(item, idx) => (item.code || item.name) + idx}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => step === 1 ? onRegionPress(item) : step === 2 ? onProvincePress(item) : step === 3 ? onCityPress(item) : onBarangayPress(item)} style={{ padding: 14, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }}>
                <Text style={{ color: '#0f172a' }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <View style={{ padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e6e9ef' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => { if (step === 1) onClose(); else setStep(s => s - 1); }} style={{ padding: 10 }}>
              <Text style={{ color: '#374151' }}>{step === 1 ? 'Close' : 'Back'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setStep(1); setSelectedProvince(null); setSelectedCity(null); setSelectedBarangay(null); }} style={{ padding: 10 }}>
              <Text style={{ color: '#ef4444' }}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
