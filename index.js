const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');

const task = offset =>
    new Promise((resolve, reject) => {
        let url = 'https://www.npmjs.com/browse/depended';
        axios
            .get(url, {
                params: {
                    offset: offset * 36
                }
            })
            .then(({ data }) => {
                const $ = cheerio.load(data);
                let $packages = $('.package-list-item__capsule___3_4Eo');

                let json = $packages.map((i, package) => {
                    const title = $(package)
                        .find('.package-list-item__title___sqwj8')
                        .html();
                    const description = $(package)
                        .find('.package-list-item__description___1nEpN')
                        .html();

                    return {
                        title,
                        description
                    };
                });

                resolve(Array.from(json));
            })
            .catch(e => {
                reject(e);
            });
    });

Promise.all(Array.from(Array(6), (v, i) => i).map(v => task(v))).then(res => {
    let ret = res
        .reduce((prev, cur) => {
            prev = prev.concat(cur);
            return prev;
        }, [])
        .slice(0, 200)
        .map((v, rank) => {
            return {
                ...v,
                rank
            };
        });

    fs.writeFileSync(
        './data.json',
        JSON.stringify(
            {
                errno: 0,
                errMsg: '',
                data: ret
            },
            null,
            2
        )
    );
});
