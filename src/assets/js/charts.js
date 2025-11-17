// charts.js
import ApexCharts from "apexcharts";

export async function renderAccountCharts(roleElId, statusElId, API_BASE_URL) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/accounts/list`);
        const data = await res.json();
        const users = data.content || [];

        // 計算角色
        const roleCount = { admin: 0, member: 0, vendor: 0 };
        // 計算狀態
        const statusCount = { test: 0, active: 0, inactive: 0, blocked: 0 };

        users.forEach(user => {
            const roleId = user.userId?.id;
            switch (Number(roleId)) {
                case 1: roleCount.admin++; break;
                case 2: roleCount.member++; break;
                case 3: roleCount.vendor++; break;
            }

            switch (Number(user.status)) {
                case 0: statusCount.test++; break;
                case 1: statusCount.active++; break;
                case 2: statusCount.inactive++; break;
                case 3: statusCount.blocked++; break;
            }
        });

        // Donut: 角色統計（左邊）
        const roleOptions = {
            chart: {
                type: 'donut',
                width: '85%', // 從 90% 改為 85%
                height: 320,  // 從 350 改為 320
            },
            series: [roleCount.admin, roleCount.member, roleCount.vendor],
            labels: ['管理員', '會員', '廠商'],
            colors: ['#0d6efd', '#60bdf3ff', '#ffc107'],
            legend: {
                position: 'bottom',
                fontSize: '13px', // 從 14px 改為 13px
                fontFamily: 'Unbounded, sans-serif'
            },
            title: {
                text: '帳號角色統計',
                align: 'center',
                style: {
                    fontSize: '15px', // 從 16px 改為 15px
                    fontFamily: 'Unbounded, sans-serif',
                    fontWeight: '700'
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '13px', // 從 14px 改為 13px
                    fontFamily: 'Unbounded, sans-serif'
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%', // 從 65% 改為 70%，讓甜甜圈更細
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: '總計',
                                fontSize: '15px', // 從 16px 改為 15px
                                fontFamily: 'Unbounded, sans-serif',
                                fontWeight: 600
                            }
                        }
                    }
                }
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: { height: 280, width: '100%' }, // 從 300 改為 280
                        legend: { position: 'bottom' }
                    }
                }
            ]
        };

        new ApexCharts(document.querySelector(`#${roleElId}`), roleOptions).render();

        // Bar: 狀態統計（右邊）
        const statusOptions = {
            chart: {
                type: 'bar',
                width: '85%', // 從 90% 改為 85%
                height: 320,  // 從 350 改為 320
                toolbar: {
                    show: false
                }
            },
            series: [{
                name: "帳號數量",
                data: [
                    statusCount.test,
                    statusCount.active,
                    statusCount.inactive,
                    statusCount.blocked
                ]
            }],
            xaxis: {
                categories: ["測試用", "啟用", "停用", "黑名單"],
                labels: {
                    style: {
                        fontSize: '11px', // 從 12px 改為 11px
                        fontFamily: 'Unbounded, sans-serif'
                    }
                }
            },
            yaxis: {
                title: {
                    text: '帳號數量',
                    style: {
                        fontSize: '13px', // 從 14px 改為 13px
                        fontFamily: 'Unbounded, sans-serif',
                        fontWeight: 600
                    }
                },
                labels: {
                    style: {
                        fontSize: '11px', // 從 12px 改為 11px
                        fontFamily: 'Unbounded, sans-serif'
                    }
                }
            },
            colors: ['#000000ff', '#198754', '#646464ff', '#dc3545'],
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '11px', // 從 12px 改為 11px
                    fontFamily: 'Unbounded, sans-serif',
                    fontWeight: 600
                }
            },
            legend: { show: false },
            plotOptions: {
                bar: {
                    distributed: true,
                    borderRadius: 4,
                    columnWidth: '45%' // 從 50% 改為 45%
                }
            },
            title: {
                text: '帳號狀態統計',
                align: 'center',
                style: {
                    fontSize: '15px', // 從 16px 改為 15px
                    fontFamily: 'Unbounded, sans-serif',
                    fontWeight: '700'
                }
            },
            grid: {
                borderColor: '#f1f1f1',
                padding: {
                    bottom: 10
                }
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: { height: 280, width: '100%' }, // 從 300 改為 280
                        plotOptions: {
                            bar: {
                                columnWidth: '65%' // 從 70% 改為 65%
                            }
                        }
                    }
                }
            ]
        };

        new ApexCharts(document.querySelector(`#${statusElId}`), statusOptions).render();

        return { roleCount, statusCount };
    } catch (err) {
        console.error("抓取帳號資料失敗:", err);
        return null;
    }
}